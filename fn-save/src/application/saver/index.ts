import { PlanetRepository } from 'src/domain/repository';

import { SaverReq, SaverRes } from './dto';

export class Saver {
  #planetRepository: PlanetRepository;

  constructor(dependencies: { planetRepository: PlanetRepository }) {
    this.#planetRepository = dependencies.planetRepository;
  }

  async run({ id, customParams }: SaverReq): Promise<SaverRes> {
    await this.#planetRepository.addCustomParams(id, customParams);

    return { ok: true };
  }
}
