const express = require('express')
const passport = require('passport')
const log4js = require('log4js')
const logger = log4js.getLogger()
const userModel = require('../models/user')
const questsModel = require('../models/quest')

const router = express.Router()

router.get('/', (req, res, next) => {
    res.render('index')
})

//FUNCTIONS
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    logger.warn('Usuario anonimo está intentando acceder a una ruta privada')
    res.redirect('/')
}

function isAdmin(req, res, next) {
    if (req.user.isAdmin) {
        return next()
    } else {
        logger.warn('Usuario ' + req.user.name + ' está intentando acceder a una ruta de administrador')
        res.redirect('/')
    }
}

//AUTH
router.get('/signup', (req, res, next) => {
    res.render('signup')
})

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    passReqToCallback: true
}))

router.get('/signin', (req, res, next) => {
    res.render('signin')
})

router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/signin',
    passReqToCallback: true
}))

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.redirect('/signin')
    })
})

//USER
router.get('/profile', isAuthenticated, (req, res, next) => {
    res.render('profile')
})

router.post('/profile/update', isAuthenticated, async (req, res, next) => {
    try {
        const oldProfile = await userModel.findOne({ email: req.user.email }).exec()

        const newProfile = {
            email: req.body.email,
            name: req.body.name,
        }

        try {
            await userModel.findOneAndUpdate({ email: oldProfile.email }, { email: newProfile.email, name: newProfile.name }, { upsert: true }).exec()
            logger.info('Perfil de ' + oldProfile.name + ' ' + oldProfile.lastname + ' actualizado exitosamente')
            res.redirect('/profile')
        } catch (err) {
            logger.error(err)
        }
    } catch (err) {
        logger.error(err)
    }
})

//QUESTS
router.get('/quests', isAuthenticated, async (req, res, next) => {
    const quests = await questsModel.find()

    res.render('quests', {
        quests: quests
    })
})

router.post('/quests/create', isAuthenticated, async (req, res, next) => {
    try {
        const newQuest = {
            quest: req.body.quest,
            topic: req.body.topic,
            ageR: req.body.ageR,
        }

        try {
            await questsModel.create(newQuest)
            logger.info('Pregunta creada exitosamente.')
            res.redirect('/quests')
        } catch (err) {
            logger.error(err)
        }
    } catch (err) {
        logger.error(err)
    }
})

//API
router.get('/api/randomquest', isAuthenticated, async (req, res, next) => {
    const quests = await questsModel.find()

    res.json(quests)
})

router.get('/api/:id', isAuthenticated, async (req, res, next) => {
    const quest = await questsModel.findOne({ _id: req.params.id }).exec()
    res.json(quest)
})

module.exports = router