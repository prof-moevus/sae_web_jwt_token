const fs = require('fs');
const path = require('path');

const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_SERVER}`;

console.log(uri)
