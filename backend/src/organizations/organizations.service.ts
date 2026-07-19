import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {

  constructor(
    @InjectRepository(Organization)
    private readonly repository: Repository<Organization>,
  ) {}

  create(data: any) {
    const organization = this.repository.create(data);
    return this.repository.save(organization);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const organization = await this.repository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async remove(id: number) {
    const organization = await this.findOne(id);
    return this.repository.remove(organization);
  }
}