import apiClient from './api';

export interface Promotion {
    id?: number;
    code: string;
    name: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'ROOM_UPGRADE' | 'FREE_NIGHTS';
    value: number;
    maxDiscount?: number;
    minBookingAmount?: number;
    startDate: string;
    endDate: string;
    maxUsage?: number;
    usedCount?: number;
    active: boolean;
}

export interface CreatePromotionRequest {
    code: string;
    name: string;
    description?: string;
    type: string;
    value: number;
    maxDiscount?: number;
    minBookingAmount?: number;
    startDate: string;
    endDate: string;
    maxUsage?: number;
}

export interface PromotionValidationResponse {
    valid: boolean;
    discount: number;
    finalAmount: number;
    message?: string;
}

class PromotionService {
    // ============ PROMOTION APIs ============

    async getAllPromotions(): Promise<Promotion[]> {
        try {
            console.log('📋 Fetching all promotions...');
            const response = await apiClient.get<Promotion[]>('/promotions');
            console.log('✅ Promotions fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get promotions error:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách khuyến mãi');
        }
    }

    async getPromotionById(id: number): Promise<Promotion> {
        try {
            console.log(`📋 Fetching promotion ${id}...`);
            const response = await apiClient.get<Promotion>(`/promotions/${id}`);
            console.log('✅ Promotion fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get promotion by id error:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin khuyến mãi');
        }
    }

    async getPromotionByCode(code: string): Promise<Promotion> {
        try {
            console.log(`📋 Fetching promotion by code: ${code}...`);
            const response = await apiClient.get<Promotion>(`/promotions/code/${code}`);
            console.log('✅ Promotion fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get promotion by code error:', error);
            throw new Error(error.response?.data?.message || 'Không tìm thấy mã khuyến mãi');
        }
    }

    async getActivePromotions(): Promise<Promotion[]> {
        try {
            console.log('📋 Fetching active promotions...');
            const response = await apiClient.get<Promotion[]>('/promotions/active');
            console.log('✅ Active promotions fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get active promotions error:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách khuyến mãi');
        }
    }

    async getPromotionsByType(type: string): Promise<Promotion[]> {
        try {
            console.log(`📋 Fetching promotions by type: ${type}...`);
            const response = await apiClient.get<Promotion[]>(`/promotions/type/${type}`);
            console.log('✅ Promotions by type fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get promotions by type error:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách khuyến mãi');
        }
    }

    async createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
        try {
            console.log('➕ Creating promotion:', data);
            const response = await apiClient.post<Promotion>('/promotions', data);
            console.log('✅ Promotion created:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Create promotion error:', error.response?.data || error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Không thể tạo khuyến mãi');
        }
    }

    async updatePromotion(id: number, data: CreatePromotionRequest): Promise<Promotion> {
        try {
            console.log('🔄 Updating promotion:', id, data);
            const response = await apiClient.put<Promotion>(`/promotions/${id}`, data);
            console.log('✅ Promotion updated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Update promotion error:', error);
            throw new Error(error.response?.data?.message || 'Không thể cập nhật khuyến mãi');
        }
    }

    async togglePromotionStatus(id: number): Promise<Promotion> {
        try {
            console.log(`🔄 Toggling promotion status for ${id}...`);
            const response = await apiClient.put<Promotion>(`/promotions/${id}/toggle-status`);
            console.log('✅ Promotion status toggled:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Toggle promotion status error:', error);
            throw new Error(error.response?.data?.message || 'Không thể thay đổi trạng thái khuyến mãi');
        }
    }

    async deletePromotion(id: number): Promise<void> {
        try {
            console.log('🗑️ Deleting promotion:', id);
            await apiClient.delete(`/promotions/${id}`);
            console.log('✅ Promotion deleted');
        } catch (error: any) {
            console.error('❌ Delete promotion error:', error);
            throw new Error(error.response?.data?.message || 'Không thể xóa khuyến mãi');
        }
    }

    async validatePromotionCode(code: string, bookingAmount: number): Promise<Promotion> {
        try {
            console.log(`🔍 Validating promotion code: ${code} for amount: ${bookingAmount}...`);
            const response = await apiClient.post<Promotion>('/promotions/validate', null, {
                params: { code, bookingAmount }
            });
            console.log('✅ Promotion validated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Validate promotion error:', error);
            throw new Error(error.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
        }
    }

    async calculateDiscount(code: string, bookingAmount: number): Promise<{ discount: number; finalAmount: number }> {
        try {
            console.log(`💰 Calculating discount for code: ${code}, amount: ${bookingAmount}...`);
            const response = await apiClient.post<{ discount: number; finalAmount: number }>(
                '/promotions/calculate-discount',
                null,
                {
                    params: { code, bookingAmount }
                }
            );
            console.log('✅ Discount calculated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Calculate discount error:', error);
            throw new Error(error.response?.data?.message || 'Không thể tính giảm giá');
        }
    }

    // ============ BOOKING PROMOTION APIs ============

    async applyPromotionToBooking(bookingId: number, promotionCode: string): Promise<any> {
        try {
            console.log(`➕ Applying promotion ${promotionCode} to booking ${bookingId}...`);
            const response = await apiClient.post(
                `/bookings/${bookingId}/promotions`,
                null,
                {
                    params: { promotionCode }
                }
            );
            console.log('✅ Promotion applied to booking:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Apply promotion to booking error:', error);
            throw new Error(error.response?.data?.message || 'Không thể áp dụng mã giảm giá');
        }
    }

    async removePromotionFromBooking(bookingId: number, promotionId: number): Promise<any> {
        try {
            console.log(`🗑️ Removing promotion ${promotionId} from booking ${bookingId}...`);
            const response = await apiClient.delete(`/bookings/${bookingId}/promotions/${promotionId}`);
            console.log('✅ Promotion removed from booking:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Remove promotion from booking error:', error);
            throw new Error(error.response?.data?.message || 'Không thể xóa mã giảm giá');
        }
    }

    // ============ HELPER METHODS ============

    formatDiscountValue(promotion: Promotion): string {
        if (promotion.type === 'PERCENTAGE') {
            return `${promotion.value}%`;
        } else if (promotion.type === 'FIXED_AMOUNT') {
            return `${promotion.value.toLocaleString('vi-VN')} VNĐ`;
        }
        return promotion.value.toString();
    }

    getPromotionTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            PERCENTAGE: 'Giảm theo %',
            FIXED_AMOUNT: 'Giảm cố định',
            ROOM_UPGRADE: 'Nâng hạng phòng',
            FREE_NIGHTS: 'Tặng đêm miễn phí'
        };
        return labels[type] || type;
    }

    isPromotionExpired(promotion: Promotion): boolean {
        const today = new Date();
        const endDate = new Date(promotion.endDate);
        return endDate < today;
    }

    isPromotionActive(promotion: Promotion): boolean {
        const today = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);

        return (
            promotion.active &&
            today >= startDate &&
            today <= endDate &&
            (promotion.maxUsage === undefined ||
                promotion.maxUsage === null ||
                (promotion.usedCount !== undefined && promotion.usedCount < promotion.maxUsage))
        );
    }

    getRemainingUsage(promotion: Promotion): number | null {
        if (!promotion.maxUsage) return null;
        return promotion.maxUsage - (promotion.usedCount || 0);
    }
}

export default new PromotionService();