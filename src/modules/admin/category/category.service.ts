import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from 'src/database/entities/category/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    // Check if name or slug already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: [{ name: dto.name }, { slug: dto.slug }],
    });

    if (existingCategory) {
      if (existingCategory.name === dto.name) {
        throw new ConflictException('Tên danh mục đã tồn tại');
      }
      if (existingCategory.slug === dto.slug) {
        throw new ConflictException('Slug đã tồn tại');
      }
    }

    const category = this.categoryRepository.create(dto);
    await this.categoryRepository.save(category);

    return {
      message: 'Tạo danh mục thành công',
      data: category,
    };
  }

  async findAll() {
    const categories = await this.categoryRepository.find({
      order: { created_at: 'DESC' },
    });

    return {
      data: categories,
      total: categories.length,
    };
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { category_id: id },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return { data: category };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { category_id: id },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Check if new name or slug conflicts with existing categories
    if (dto.name || dto.slug) {
      const existingCategory = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.category_id != :id', { id })
        .andWhere('(category.name = :name OR category.slug = :slug)', {
          name: dto.name || '',
          slug: dto.slug || '',
        })
        .getOne();

      if (existingCategory) {
        if (existingCategory.name === dto.name) {
          throw new ConflictException('Tên danh mục đã tồn tại');
        }
        if (existingCategory.slug === dto.slug) {
          throw new ConflictException('Slug đã tồn tại');
        }
      }
    }

    Object.assign(category, dto);
    await this.categoryRepository.save(category);

    return {
      message: 'Cập nhật danh mục thành công',
      data: category,
    };
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { category_id: id },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    await this.categoryRepository.remove(category);

    return { message: 'Xóa danh mục thành công' };
  }
}
