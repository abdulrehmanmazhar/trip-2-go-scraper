import express from 'express'
import {
    activateUser,
    fetchAllUsers,
    getGoogleAuthURL,
    getUserInfo,
    googleCallback,
    LoginUser,
    logoutUser,
    readUserMails,
    registrationUser,
    socialAuth,
    updateAccessToken,
    updateProfilePicture,
    updateRole
} from '../controller/user.controller.js'
import { authorizeRoles, isAuthenticated } from '../middleware/auth.js'
const router = express.Router()

router.post('/registration', registrationUser)
router.post('/activate-user', activateUser)
router.post('/login', LoginUser)
router.post('/logout', isAuthenticated, logoutUser)
router.get('/refresh', updateAccessToken)
router.get('/me', isAuthenticated, getUserInfo)
router.post('/social-auth', socialAuth)
router.get('/get-google-auth-url', getGoogleAuthURL)
router.get('/google-callback', googleCallback)
router.get('/read-mails', isAuthenticated, authorizeRoles('admin'), readUserMails)
router.put('/update-user-avatar', isAuthenticated, updateProfilePicture)
router.get('/get-all-users-admin', isAuthenticated, authorizeRoles('admin'), fetchAllUsers)
router.put('/update-user-role', isAuthenticated, authorizeRoles('admin'), updateRole)

export default router
