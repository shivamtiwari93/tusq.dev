import { Controller, Get, Post, UseGuards } from '@nestjs/common';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  @Get()
  listUsers() {
    return [];
  }

  @UseGuards(AdminGuard)
  @Post(':id/disable')
  disableUser() {
    return { ok: true };
  }
}
