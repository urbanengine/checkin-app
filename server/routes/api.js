const express = require('express');
const router = express.Router();

// declare axios for making http requests
const axios = require('axios');
const baseUrl = 'http://www.openhuntsville.com/api/v1/';

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

module.exports = router;

