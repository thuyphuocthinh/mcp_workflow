import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelKeyService } from './services/modelKey.service';
import { ModelKey, ModelKeySchema } from './schemas/modelKey.schema';
import { ModelKeyController } from './models.controller';
import { EncryptionService } from './services/crypto.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelKey.name, schema: ModelKeySchema },
    ]),
  ],
  providers: [ModelKeyService, EncryptionService],
  controllers: [ModelKeyController]
})
export class ModelKeyModule {}
