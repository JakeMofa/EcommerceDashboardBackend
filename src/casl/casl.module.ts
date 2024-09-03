import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { DatabaseCommerceModule } from 'src/brands/database.service';

@Module({
  imports: [DatabaseCommerceModule],
  controllers: [],
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
