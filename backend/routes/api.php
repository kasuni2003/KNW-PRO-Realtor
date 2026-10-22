<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\AdminUserController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\LawyerController;
use App\Http\Controllers\PaymentRecordController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PropertyInquiryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SavedPropertyController;
use App\Http\Controllers\SellerPropertyDraftController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['status' => 'ok']));

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/apply-seller', [AuthController::class, 'applyForSeller']);
});
Route::post('/user/apply-seller', [AuthController::class, 'applyForSeller']);

Route::post('/seller/listings', [SellerPropertyDraftController::class, 'store']);
Route::get('/seller/listings', [SellerPropertyDraftController::class, 'sellerListings']);
Route::post('/seller/listings/{id}/documents', [SellerPropertyDraftController::class, 'uploadDocuments']);
Route::get('/seller/inquiries', [PropertyInquiryController::class, 'sellerIndex']);
Route::get('/seller/payments', [PaymentRecordController::class, 'sellerIndex']);
Route::patch('/seller/inquiries/{id}', [PropertyInquiryController::class, 'update']);
Route::get('/properties', [SellerPropertyDraftController::class, 'publicIndex']);
Route::get('/properties/{id}', [SellerPropertyDraftController::class, 'publicShow']);
Route::post('/properties/{id}/inquiries', [PropertyInquiryController::class, 'store']);
Route::post('/properties/{id}/site-visits', [PropertyInquiryController::class, 'bookSiteVisit']);
Route::get('/buyer/inquiries', [PropertyInquiryController::class, 'buyerInquiries']);
Route::patch('/site-visits/{id}', [PropertyInquiryController::class, 'updateSiteVisit']);
Route::get('/properties/{id}/saved', [SavedPropertyController::class, 'status']);
Route::post('/properties/{id}/saved', [SavedPropertyController::class, 'store']);
Route::delete('/properties/{id}/saved', [SavedPropertyController::class, 'destroy']);
Route::get('/blog/posts', [BlogPostController::class, 'published']);
Route::get('/lawyers', [LawyerController::class, 'publicLawyers']);
Route::get('/lawyers/{lawyerId}/slots', [LawyerController::class, 'availableSlots']);
Route::post('/appointments', [LawyerController::class, 'bookAppointment']);
Route::get('/user/appointments', [LawyerController::class, 'userAppointments']);
Route::post('/payments/payhere/checkout', [PaymentController::class, 'payHereCheckout']);
Route::get('/reviews', [ReviewController::class, 'publicIndex']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/user/reviews', [ReviewController::class, 'userReviews']);
Route::delete('/user/reviews/{id}', [ReviewController::class, 'destroyUserReview']);
Route::get('/saved-properties', [SavedPropertyController::class, 'index']);
Route::get('/notifications', [NotificationController::class, 'index']);
Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

Route::prefix('lawyer')->group(function () {
    Route::get('/{lawyerId}/dashboard', [LawyerController::class, 'dashboard']);
    Route::put('/{lawyerId}/profile', [LawyerController::class, 'upsertProfile']);
    Route::post('/{lawyerId}/availability', [LawyerController::class, 'storeAvailability']);
    Route::patch('/availability/{id}', [LawyerController::class, 'updateAvailability']);
    Route::delete('/availability/{id}', [LawyerController::class, 'deleteAvailability']);
    Route::post('/{lawyerId}/blocked-dates', [LawyerController::class, 'blockDate']);
    Route::patch('/appointments/{id}', [LawyerController::class, 'updateAppointment']);
    Route::get('/property-verifications', [SellerPropertyDraftController::class, 'lawyerVerifications']);
    Route::patch('/property-verifications/{id}/review', [SellerPropertyDraftController::class, 'reviewLegalDocuments']);
    Route::get('/posts', [BlogPostController::class, 'lawyerPosts']);
    Route::post('/posts', [BlogPostController::class, 'store']);
    Route::patch('/posts/{id}', [BlogPostController::class, 'update']);
    Route::patch('/posts/{id}/submit', [BlogPostController::class, 'submit']);
    Route::delete('/posts/{id}', [BlogPostController::class, 'destroy']);
});

Route::prefix('admin')->group(function () {
    Route::get('/summary', [AdminUserController::class, 'summary']);
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::patch('/users/{id}/suspend', [AdminUserController::class, 'suspend']);
    Route::patch('/users/{id}/role', [AdminUserController::class, 'updateRole']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    Route::get('/sellers/pending', [AdminUserController::class, 'pendingSellers']);
    Route::get('/sellers/{id}/document', [AdminUserController::class, 'viewSellerDocument']);
    Route::patch('/sellers/{id}/approve', [AdminUserController::class, 'approveSeller']);
    Route::patch('/sellers/{id}/reject', [AdminUserController::class, 'rejectSeller']);
    Route::get('/listings/pending', [SellerPropertyDraftController::class, 'pending']);
    Route::get('/listings/published', [SellerPropertyDraftController::class, 'publishedForAdmin']);
    Route::patch('/listings/{id}/mark-paid', [SellerPropertyDraftController::class, 'markPaid']);
    Route::patch('/listings/{id}/approve', [SellerPropertyDraftController::class, 'approve']);
    Route::patch('/listings/{id}/verify-deed', [SellerPropertyDraftController::class, 'toggleDeedVerified']);
    Route::patch('/listings/{id}/reject', [SellerPropertyDraftController::class, 'reject']);
    Route::get('/blog/posts', [BlogPostController::class, 'adminIndex']);
    Route::post('/blog/posts', [BlogPostController::class, 'store']);
    Route::patch('/blog/posts/{id}', [BlogPostController::class, 'update']);
    Route::patch('/blog/posts/{id}/approve', [BlogPostController::class, 'approve']);
    Route::patch('/blog/posts/{id}/reject', [BlogPostController::class, 'reject']);
    Route::delete('/blog/posts/{id}', [BlogPostController::class, 'destroy']);
    Route::get('/appointments', [LawyerController::class, 'adminAppointments']);
    Route::patch('/appointments/{id}', [LawyerController::class, 'updateAppointment']);
    Route::patch('/appointments/{id}/approve-payment', [LawyerController::class, 'approveConsultationPayment']);
    Route::get('/property-inquiries', [PropertyInquiryController::class, 'adminIndex']);
    Route::patch('/property-inquiries/{id}', [PropertyInquiryController::class, 'update']);
    Route::get('/payments', [PaymentRecordController::class, 'adminIndex']);
    Route::get('/reviews', [ReviewController::class, 'adminIndex']);
    Route::patch('/reviews/{id}/approve', [ReviewController::class, 'approve']);
    Route::patch('/reviews/{id}/reject', [ReviewController::class, 'reject']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});
