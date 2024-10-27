import { DateField, StringField } from '../../decorators';
import { type AbstractEntity } from '../abstract.entity';

export class AbstractDto {
  @StringField({ example: '50ffe1ea-ed4c-4062-a404-38645b95360d' })
  id!: string;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  @DateField({ nullable: true })
  deletedAt?: Date;

  @StringField({
    nullable: true,
    example: 'a152a073-c6fe-4ef4-a774-2fb9fd125487',
  })
  deletedBy?: string;

  @StringField({
    nullable: true,
    example: 'a152a073-c6fe-4ef4-a774-2fb9fd125487',
  })
  createdBy?: string;

  @StringField({
    nullable: true,
    example: 'a152a073-c6fe-4ef4-a774-2fb9fd125487',
  })
  updatedBy?: string;

  constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
    if (!options?.excludeFields) {
      this.id = entity.id;
      this.createdAt = entity.createdAt;
      this.updatedAt = entity.updatedAt;
      this.deletedAt = entity.deletedAt;
      this.deletedBy = entity.deletedBy;
      this.createdBy = entity.createdBy;
      this.updatedBy = entity.updatedBy;
    }
  }
}

export class AbstractTranslationDto extends AbstractDto {
  constructor(entity: AbstractEntity) {
    super(entity, { excludeFields: true });
  }
}
