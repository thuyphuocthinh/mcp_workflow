import { ModelKeyContract } from '../contracts/modelKey.contract';
import { ModelKeyDocument, ModelKey } from '../schemas/modelKey.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModelKeyDto } from '../dtos/modelKey.dto';
import { EncryptionService } from './crypto.service';

@Injectable()
export class ModelKeyService {
  constructor(
    @InjectModel(ModelKey.name)
    private readonly modelKeyModel: Model<ModelKeyDocument>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /* =========================
     GET ALL KEYS BY USER
     ========================= */
  async getAll(userId: string): Promise<ModelKeyContract[]> {
    const keys = await this.modelKeyModel
      .find({ user_id: new Types.ObjectId(userId) })
      .lean();

    return keys.map(
      k => new ModelKeyContract(
        k._id.toString(),
        '****' + this.encryptionService.decrypt(k.encryptedKey).slice(-4),
        k.modelType,
      ),
    );
  }

  /* =========================
     ADD KEY (UPSERT BY TYPE)
     ========================= */
  async upsertByType(
    userId: string,
    dto: ModelKeyDto,
  ): Promise<ModelKeyContract> {
    const encryptedKey = this.encryptionService.encrypt(dto.key);

    const doc = await this.modelKeyModel.findOneAndUpdate(
      {
        user_id: new Types.ObjectId(userId),
        modelType: dto.modelType,
      },
      {
        $set: {
          encryptedKey,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return new ModelKeyContract(
      doc._id.toString(),
      '****' + dto.key.slice(-4),
      doc.modelType,
    );
  }

  /* =========================
     UPDATE KEY BY MODEL TYPE
     ========================= */
  async updateByType(
    userId: string,
    modelType: string,
    newKey: string,
  ): Promise<ModelKeyContract> {
    const doc = await this.modelKeyModel.findOneAndUpdate(
      {
        user_id: new Types.ObjectId(userId),
        modelType,
      },
      {
        $set: { key: newKey },
      },
      {
        new: true,
      },
    );

    if (!doc) {
      throw new NotFoundException('Model key not found');
    }

    return new ModelKeyContract(
      doc._id.toString(),
      '****' + this.getDecryptedKey(userId, modelType),
      doc.modelType,
    );
  }

  /* =========================
     DELETE KEY BY TYPE
     ========================= */
  async deleteByType(
    userId: string,
    modelType: string,
  ): Promise<void> {
    const res = await this.modelKeyModel.deleteOne({
      user_id: new Types.ObjectId(userId),
      modelType,
    });

    if (res.deletedCount === 0) {
      throw new NotFoundException('Model key not found');
    }
  }

  async getDecryptedKey(
    userId: string,
    modelType: string,
  ): Promise<string> {
    const doc = await this.modelKeyModel.findOne({
      user_id: new Types.ObjectId(userId),
      modelType,
    });

    if (!doc) {
      throw new NotFoundException('Model key not found');
    }

    return this.encryptionService.decrypt(doc.encryptedKey);
  }
}
