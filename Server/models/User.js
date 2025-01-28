const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatar: { type: String }, // URL к аватарке или путь на сервере
    firstName: { type: String },
    lastName: { type: String },
    middleName: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    birthDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    resetPasswordToken: { type: String }, // Токен восстановления
    resetPasswordExpires: { type: Date }, // Срок действия токена
  });
  

module.exports = mongoose.model('User', userSchema);
