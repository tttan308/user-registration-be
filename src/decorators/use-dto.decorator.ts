import { type Constructor } from '../types';

export function UseDto(dtoClass: Constructor): ClassDecorator {
  return (ctor) => {
    if (!(<unknown>dtoClass)) {
      throw new Error('UseDto decorator requires dtoClass');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ctor.prototype.dtoClass = dtoClass;
  };
}
