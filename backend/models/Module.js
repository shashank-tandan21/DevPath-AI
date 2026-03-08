const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Module = sequelize.define('Module', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.STRING
    },
    difficulty: {
        type: DataTypes.STRING
    },
    estimated_time_minutes: {
        type: DataTypes.INTEGER
    },
    content: {
        type: DataTypes.TEXT, // We'll stringify the object
        get() {
            const rawValue = this.getDataValue('content');
            return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
            this.setDataValue('content', JSON.stringify(value));
        }
    },
    quiz: {
        type: DataTypes.TEXT, // We'll stringify the array
        get() {
            const rawValue = this.getDataValue('quiz');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('quiz', JSON.stringify(value));
        }
    },
    source_video_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    source_url: {
        type: DataTypes.STRING
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Module;
