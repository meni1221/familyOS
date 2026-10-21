import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

/**
 * A page of a list endpoint.
 *
 * `hasMore` rather than a total: the client needs to know whether to offer
 * another page, and a `countDocuments` on every list is a second query for a
 * number nothing on screen shows.
 */
export interface Page<T> {
  data: T[];
  hasMore: boolean;
}

/**
 * Where a list starts and how much of it comes back.
 *
 * Offset rather than cursor: these lists are ordered by a date the user can
 * edit, and a cursor over an editable date can skip a record that moved between
 * pages. An offset cannot skip — at worst it repeats a row, which is visible.
 */
export class PageQueryDto {
  @ApiPropertyOptional({
    default: DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    description: `Records to return (1–${MAX_PAGE_SIZE}).`,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'המגבלה חייבת להיות מספר שלם' })
  @Min(1, { message: 'המגבלה חייבת להיות לפחות 1' })
  @Max(MAX_PAGE_SIZE, { message: `אפשר לבקש עד ${MAX_PAGE_SIZE} רשומות בכל בקשה` })
  limit?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0, description: 'Records to skip.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ההיסט חייב להיות מספר שלם' })
  @Min(0, { message: 'ההיסט לא יכול להיות שלילי' })
  offset?: number;
}

export const resolvePage = (query: PageQueryDto): { limit: number; offset: number } => ({
  limit: query.limit ?? DEFAULT_PAGE_SIZE,
  offset: query.offset ?? 0,
});

/**
 * `items` is expected to hold one record more than the page needs — that extra
 * record is how `hasMore` is known without counting the collection.
 */
export const toPage = <T>(items: T[], limit: number): Page<T> => ({
  data: items.slice(0, limit),
  hasMore: items.length > limit,
});
