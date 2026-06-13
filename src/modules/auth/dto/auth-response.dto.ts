import { UserResponseDto } from '../../users/dto/user-response.dto';
import { TokenResponseDto } from './token-response.dto';

export class AuthResponseDto {
  user: UserResponseDto;
  tokens: TokenResponseDto;
}
