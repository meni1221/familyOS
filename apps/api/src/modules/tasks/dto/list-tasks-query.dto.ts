import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageQueryDto } from '../../../pagination/pagination';

/** `open` means "not completed yet", which is how the board groups tasks. */
export type TaskBoardFilter = 'open' | 'completed';

export class ListTasksQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: ['open', 'completed'],
    description: 'Only tasks in this state. Omit for the whole board.',
  })
  @IsOptional()
  @IsIn(['open', 'completed'], { message: 'סינון סטטוס לא נתמך' })
  status?: TaskBoardFilter;
}
