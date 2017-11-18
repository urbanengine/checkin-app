const express = require('express');
const router = express.Router();

// declare axios for making http requests
const axios = require('axios');
const baseUrl = 'https://www.openhuntsville.com/api/v1/';

router.get('/data', (req, res) => {
  try {
  data = {};
  const cwnNumberRequest = axios.get(`${baseUrl}next_cwn_number/`, {headers: {"Authorization": process.env.APIKEY}})
    .then(response => {
      data.cwnNumber = response.data.cwnNumber;
    });
  const usersRequest = axios.get(`${baseUrl}users/`, {headers: {"Authorization": process.env.APIKEY}})
    .then(response => {
     data.users = response.data;
    });

  Promise.all([cwnNumberRequest, usersRequest])
  .then(() => {
    res.status(200).json(data);
  }).catch(error => {
    res.status(500).send(error)
  });
}
catch(e)
{
  console.log("error");
  console.log(e);
}
  
});

router.post('/checkin', (req, res) => {
  try {
    console.log(req.body);
  axios.post(`${baseUrl}checkin`, JSON.stringify(req.body), {headers: {"Authorization": process.env.APIKEY,}})
    .then(response => {
      if (response.status == 200)
      {
        res.sendStatus(200);
      }
      else
      {
      res.status(response.status).json({error : response.statusText});
      }
      }).catch((error) => {
        if (error.response)
        {
        console.log(error.response.data)
        console.log(error.response.status);
        console.log(error.response.statusText);
        res.status(error.response.status).json(error.response.data);
        }
      });
  }
  catch(e) {
    res.status(500).json({error:'Internal Server Error'});
  }
});

module.exports = router;

