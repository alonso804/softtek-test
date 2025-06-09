import { PlanetRepository } from 'src/domain/repository';

import { GetterReq, GetterRes } from './dto';

export class Getter {
  #planetRepository: PlanetRepository;

  constructor(dependencies: { planetRepository: PlanetRepository }) {
    this.#planetRepository = dependencies.planetRepository;
  }

  async run(payload: GetterReq): Promise<GetterRes> {
    const planets = await this.#planetRepository.find({}, payload.pagination);

    return planets;
  }
}
