import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import * as hbsUtils from 'hbs-utils';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';


// Configuring Handlebars
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  hbs.registerPartials(join(__dirname, '..', 'views/layouts'));
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views/layout'));

  app.setViewEngine('hbs');
  app.use(
    session({
      secret: 'nest-book',
      resave: false,
      saveUninitialized:false,
    }),
  );
  app.use(function(req, res, next){
    res.locals.session = req.session;
    const flashErrors: string[] = req.session.flashErrors;
    if (flashErrors) {
      res.locals.flashErrors = flashErrors;
      req.session.flashErrors = null;
    }
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Online Store API')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
