import express from 'express'
import  multer from "multer"
import  path from "path"
import { authUser,registerUser,
    logoutUser,verifyUser,addProduct,changePassword} from '../controllers/userController.js'
 import { protect } from '../middleware/authMiddleware.js'
const router = express.Router()
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/productImages"));
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },
  });
  const upload = multer({ storage: storage });

router.post('/', registerUser)
router.post('/auth', authUser)
router.post('/logout', logoutUser)
router.post('/verify-user',verifyUser)
router.post('add-product', protect, upload.array("image", 3), addProduct)
router.post('/change-password',protect,changePassword)

export default router