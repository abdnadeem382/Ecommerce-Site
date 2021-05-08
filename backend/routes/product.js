const express = require("express");
const router = express.Router();


const {
    getProducts, 
    newProduct, 
    getSingleProduct, 
    updateProduct, 
    deleteProduct, 
    createNewReview, 
    getAllReviews, 
    deleteReview
} = require('../controllers/productController');

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');


router.route('/products').get(getProducts);
router.route('/admin/product/new').post(isAuthenticatedUser ,authorizeRoles('admin'),newProduct);
router.route('/product/:id').get(getSingleProduct);
router.route('/admin/product/:id')
                                .put(isAuthenticatedUser,authorizeRoles('admin') ,updateProduct)
                                .delete(isAuthenticatedUser,authorizeRoles('admin') ,deleteProduct);
router.route('/review').put(isAuthenticatedUser, createNewReview)
router.route('/reviews').get(isAuthenticatedUser, getAllReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteReview)


module.exports = router;