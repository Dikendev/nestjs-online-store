import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  findOne(id: number): Promise<Product> {
    const options: FindOneOptions<Product> = {
      where: { id },
    };
    return this.productsRepository.findOne(options);
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return this.productsRepository.findByIds(ids);
  }

  createOrUpdate(product: Product): Promise<Product> {
    return this.productsRepository.save(product);
  };

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
