import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Hello')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns hello world message',
    type: String 
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('welcome')
  @ApiOperation({ summary: 'Welcome to project' })
  @ApiResponse({
    status: 200,
    description: 'Returns personalized welcome message',
    type: String,
  })
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'The name to include in the welcome message',
    type: String,
  })
  welcomeToProject(
    @Query('name') name: string
  ): string {
    return `Welcome to project, ${name}!`;
  }
}
