export type AuthenticatedUser = {
  userId: string;
  email: string;
};

export type RefreshAuthenticatedUser = AuthenticatedUser & {
  refreshToken: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  jti?: string;
};
