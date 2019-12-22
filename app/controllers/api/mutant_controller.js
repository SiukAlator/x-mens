var locomotive = require('locomotive'),
  pg = require('pg'),
  xmens = rootRequire('x-mens/index.js'),
  async = require('async'),
  Controller = locomotive.Controller,
  MutantController = new Controller();

MutantController.create = function () {

  let req = this.req,
    res = this.res,
    me = this,
    AllowedValues = ['A', 'T', 'C', 'G'],
    pDna = JSON.parse(this.param('dna'));


  async.waterfall(
    [
      function (callback) {
        return isValidateFormat(callback);
      },
      function (resultado, callback) {
        // done();
        return res.send(resultado);
      }
    ],
    function (err, status) {
      // console.log(err);
      // done();
      return res.send(xmens.wrapper(xmens.constants.INTERNAL_ERROR));
    }
  );

  function validateOblicuaIzqDer(posIzq, matriz) {
   /**Función que recorre en forma diagonal de izquierda a derecha la matriz */
    let i = 0;
    let j = posIzq;
    let countOblicua = 0;
    let lastOblicua = '';
    let isMutant = false;
    while (i < matriz.length && j < matriz[i].length) {
      if (AllowedValues.indexOf(matriz[i][j]) == -1)
        return xmens.wrapper(xmens.constants.BAD_FORMAT_CONTENT);
      if (i == 0)
        lastOblicua = matriz[i][j];
      else {
        if (lastOblicua == matriz[i][j])
          countOblicua++;
        else {
          lastOblicua = matriz[i][j];
          countOblicua = 0;
        }
        if (countOblicua == 4)
        {
          isMutant = xmens.wrapper(xmens.constants.IS_MUTANT);
          break;
        }
      }
      i++;
      j++;
    }
    return isMutant;
  }

  function validateOblicuaDerIzq(posIzq, matriz) {
    /**Función que recorre en forma diagonal de derecha a izquierda la matriz */
    let i = 0;
    let j = posIzq;
    let countOblicua = 0;
    let lastOblicua = '';
    let isMutant = false;
    while (i < matriz.length && j >= 0) {
      if (AllowedValues.indexOf(matriz[i][j]) == -1)
        return xmens.wrapper(xmens.constants.BAD_FORMAT_CONTENT);
      if (i == 0)
        lastOblicua = matriz[i][j];
      else {
        if (lastOblicua == matriz[i][j])
          countOblicua++;
        else {
          lastOblicua = matriz[i][j];
          countOblicua = 0;
        }
        if (countOblicua == 4)
        {
          isMutant = xmens.wrapper(xmens.constants.IS_MUTANT);
          break;
        }
      }
      i++;
      j--;
    }
    return isMutant;
  }

  function isValidateFormat(cb) {
    let lengthEjeY = pDna.length;
    let lastLetterHorizontal = '';
    let countHorizontal = 0;
    let lastLetterVertical = '';
    let countVertical = 0;
    for (let i in pDna) {
      if (lengthEjeY != pDna[i].length)
        return cb(null, xmens.wrapper(xmens.constants.BAD_MATRIX));
      for (let j in pDna[i]) {
        
        if (i == 0) {
          /**Evalua oblicua de izquierda a derecha */
          let res = validateOblicuaIzqDer(j, pDna);
          if (res != false)
            return cb(null, res);
           /**Evalua oblicua de derecha a izquierda*/
          res = validateOblicuaDerIzq(j, pDna);
          if (res != false)
            return cb(null, res);
          /**Evalua vertical */
          lastLetterVertical = pDna[i][j];
          let indexY = i;
          while (indexY < pDna.length) {
            if (AllowedValues.indexOf(pDna[indexY][j]) == -1)
              return cb(null, xmens.wrapper(xmens.constants.BAD_FORMAT_CONTENT));
            if (lastLetterVertical == pDna[indexY][j])
              countVertical++;
            else {
              lastLetterVertical = pDna[indexY][j];
              countVertical = 0;
            }
            if (countVertical == 4)
            {
              return cb(null, xmens.wrapper(xmens.constants.IS_MUTANT));

            }
            indexY ++;
          }
        }
        
        if (j == 0)
        {
          /**Evalua oblicua de izquierda a derecha */
          let res = validateOblicuaIzqDer(j, pDna);
          if (res != false)
            return cb(null, res);
          lastLetterHorizontal = pDna[i][j];
        }
        else {
          /**Evalua horizontal */
          if (lastLetterHorizontal == pDna[i][j])
            countHorizontal++;
          else {
            lastLetterHorizontal = pDna[i][j];
            countHorizontal = 0;
          }
          if (countHorizontal == 4)
            return cb(null, xmens.wrapper(xmens.constants.IS_MUTANT));
        }
        /**Evalua oblicua de derecha a izquierda */
        if (j == pDna[i].length -1)
        {
          let res = validateOblicuaDerIzq(j, pDna);
          if (res != false)
            return cb(null, res);
        }

      }
      

    }
    return cb(null,  xmens.wrapper(xmens.constants.IS_NOT_MUTANT));
  }
};

// MutantController.before('*', function(next) {

//   var req = this.req,
//     res = this.res;
//   return xmens.api.version(req.get('xmens_api_version'), function(info) {
//     if (info) return res.send(xmens.wrapper(info));
//     else return xmens.api.auth(req.get('xmens_api_token'), function(err, user, info) {
//       if (err) {
//         return res.send(xmens.wrapper(xmens.constants.INTERNAL_ERROR));
//       }
//       else if (info) return res.send(xmens.wrapper(info));
//       else {
//         req.user = user;
//         return pg.connect(process.env.DATABASE_URL, function(err, client, done) {
//           if (err) {
//             done();
//             return next(err);
//           }
//           req.pg_client = client;
//           req.pg_done = done;
//           return next();
//         });
//       }
//     });
//   });
// });

module.exports = MutantController;
