import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { Item } from 'src/models/item.entity';
import { Order } from 'src/models/order.entity';
import { OrdersService } from 'src/models/order.service';
import { Product } from 'src/models/product.entity';
import { ProductsService } from 'src/models/products.service';
import { UsersService } from 'src/models/user.service';

@Controller('/cart')
export class CartController {
  constructor(
    private readonly productService: ProductsService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get('/')
  @Render('cart/index')
  async index(@Req() request) {
    let total = 0;
    let productsInCart: Product[] = null;
    const productsInSession = request.session.products;

    if (productsInSession) {
      productsInCart = await this.productService.findByIds(
        Object.keys(productsInSession),
      );
      total = Product.sumPricesByQuantities(productsInCart, productsInSession);
    }

    const viewData = [];
    viewData['title'] = 'Cart - Online Store';
    viewData['subtitle'] = 'Shopping Cart';
    viewData['total'] = total;
    viewData['productsInCart'] = productsInCart;

    return {
      viewData: viewData,
    };
  }

  @Post('/add/:id')
  @Redirect('/cart')
  add(@Param('id') id: number, @Body() body, @Req() request) {
    let productsInSession = request.session.products;

    if (!productsInSession) {
      productsInSession = {};
    }

    productsInSession[id] = body.quantity;
    request.session.products = productsInSession;
  }

  @Get('/delete')
  @Redirect('/cart')
  delete(@Req() request) {
    request.session.products = null;
  }

  @Get('/purchase')
  async purchase(@Req() request, @Res() response) {
    if (!request.session.user) {
      return response.redirect('/auth/login');
    } else if (!request.session.products) {
      return response.redirect('/cart');
    } else {
      const user = await this.usersService.findOne(request.session.user.id);
      const productsInSession = request.session.products;
      const productsInCart = await this.productService.findByIds(
        Object.keys(productsInSession),
      );

      let total = 0;
      const items: Item[] = [];
      for (let i = 0; i < productsInCart.length; i++) {
        const quantity = productsInSession[productsInCart[i].getId()];
        const item = new Item();
        item.setQuantity(quantity);
        item.setPrice(productsInCart[i].getPrice());
        item.setProduct(productsInCart[i]);
        items.push(item);
        total = total + productsInCart[i].getPrice() * quantity;
      }

      const newOrder = new Order();
      newOrder.setTotal(total);
      newOrder.setItems(items);
      newOrder.setUser(user);
      const order = await this.ordersService.createOrUpdate(newOrder);

      const newBalance = user.getBalance() - total;
      await this.usersService.updateBalance(user.getId(), newBalance);

      request.session.products = null;

      const viewData = [];
      viewData['title'] = 'Purchase - Online Store';
      viewData['subtitle'] = 'Purchase Status';
      viewData['orderId'] = order.getId();

      return response.render('cart/purchase', { viewData: viewData });
    }
  }
}
