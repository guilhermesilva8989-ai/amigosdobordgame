import {
  IsBoolean,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SaveSiteSettingsDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  heroTitle!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  heroDescription!: string;

  @IsString()
  @MaxLength(1000)
  @Matches(/^(\/|https?:\/\/)/, {
    message:
      'A imagem deve usar um caminho local ou endereço HTTP/HTTPS.',
  })
  bannerUrl!: string;

  @IsBoolean()
  showGoal!: boolean;

  @IsIn(['FANTASY', 'REAL'])
  nameDisplayMode!: 'FANTASY' | 'REAL';
}