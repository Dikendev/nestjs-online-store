import { Controller, Get, Render, Req } from '@nestjs/common';
import { OrdersService } from 'src/models/order.service';

@Controller('/account')
export class AccountController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/orders')
  @Render('account/orders')
  async orders(@Req() request) {
    const viewData = [];
    viewData['title'] = 'My Orders - Online Store';
    viewData['subtitle'] = 'My Orders';
    viewData['orders'] = await this.ordersService.findByUserId(
      request.session.userId,
    );

    return {
      viewData: viewData,
    };
  }
}
