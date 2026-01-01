export interface i_register_request {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export type i_login_request = Pick<
  i_register_request,
  "email" | "password"
>;

export interface i_login_response {
    token: string;
}