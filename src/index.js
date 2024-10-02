import express from 'express';
import path from "path"
import { readFile } from 'fs/promises';
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import cookieParser from 'cookie-parser';
import nunjucks from 'nunjucks';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use(express.static(path.join(__dirname,"public")))

app.set('views',path.join(__dirname,"views"))
app.set('view engine', 'ejs')

app.use(cookieParser());

app.use(async (req,res,next) => {
  let key, value
  if (req.headers.cookie){
    req.headers.cookie.split('; ').forEach(cookie => {
      const [k, v] = cookie.split('=');
      if (k === 'jwt')
      {
        key = k
        value = v
      }
    });
  }
  try{
    if(req.path === '/booking' || req.path === '/login' || (req.path === '/' && (!key || !value)) ){
       next()
    }
    else {
      let token = value
      const publickey = await readFile(path.join(__dirname,'/helper/key/publickey.pem'),'utf-8') 
      let decoded = jwt.verify(token, publickey)
      req.decoded = decoded

      const username = decoded.username
      const result = await prisma.user.findUnique({
        where: {
            username: username,
          },
      })
      if (req.path === '/')
        return res.redirect("/account")
      if (result !== null){
          next()
      }
    }
  } catch (error) {
      return res.clearCookie('jwt').redirect('/')
  }
});

app.get('/', async (req, res) => {
  return res.render('index')
})

app.post('/login', async (req, res) => {
  const {username, password} = await req.body
  try{

    let result
    result = await prisma.$queryRawUnsafe(`SELECT * FROM \"user\" where username='${username}' and password='${password}'`)
    let header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: "6f597b7-fd81-44c7-956f-6937ea94cdf6"
    }
    
    let payload = {
      id: result[0].id,
      username: result[0].username
    }
    let privateKey = await readFile(path.join(__dirname,'/helper/key/privatekey.pem'),'utf-8')
    let token = jwt.sign(payload, privateKey, { algorithm: 'RS256', header });
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 10000 * 1000,
    });
    setTimeout(() => {
      return res.redirect('/account');
    }, 750);

  } catch(error) {
    setTimeout(() => {
      return res.redirect('/')
    }, 750);
  }
});

app.get('/booking', async (req, res) => {
  try {
    if (req.query.message) {
      let message = nunjucks.renderString(req.query.message);
      return res.render('booking', {data: message} )
    }
    else {
      return res.render('booking', {data: "Message not found!!"} )
    }

  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
})

app.get('/account', async (req, res) => {
  try {
    return res.render('account', {data: req.decoded})

  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
})

app.get('/logout', async (req, res) => {
  return res.clearCookie('jwt').redirect('/')
})

app.use((req, res) => {
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});