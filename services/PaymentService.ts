import apiClient from './api';


export interface CreateDepositPaymentRequest {
    bookingId: number;
    depositAmount: number;
    returnUrl?: string;
    cancelUrl?: string;
    expiredAt?: number;
}

export interface CreateCheckoutPaymentRequest {
    bookingId: number;
    remainingAmount: number;
    returnUrl?: string;
    cancelUrl?: string;
    expiredAt?: number;
}

export interface PaymentResponse {
    success: boolean;
    paymentUrl: string;
    orderCode: number;
    bookingId: number;
    amount: number;
}

export interface VerifyPaymentResponse {
    success: boolean;
    bookingId: number;
    orderCode: number;
    paymentType: 'DEPOSIT' | 'CHECKOUT';
    isPaid: boolean;
    paidAmount: number;
    totalAmount: number;
    deposit: number;
}

export interface PaymentHistoryResponse {
    success: boolean;
    bookingId: number;
    notes: string;
    paidAmount: number;
    totalAmount: number;
    deposit: number;
}


export class PaymentService {
    static async createDepositPayment(
        request: CreateDepositPaymentRequest
    ): Promise<PaymentResponse> {
        try {
            console.log('💳 Creating deposit payment:', request);

            const response = await apiClient.post('/payment/create-deposit', request);

            console.log('✅ Deposit payment created successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Create deposit payment error:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Không thể tạo thanh toán cọc. Vui lòng thử lại.'
            );
        }
    }

    static async createCheckoutPayment(
        request: CreateCheckoutPaymentRequest
    ): Promise<PaymentResponse> {
        try {
            console.log('💳 Creating checkout payment:', request);

            const response = await apiClient.post('/payment/create-checkout', request);

            console.log('✅ Checkout payment created successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Create checkout payment error:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Không thể tạo thanh toán checkout. Vui lòng thử lại.'
            );
        }
    }

    static async verifyPayment(orderCode: number): Promise<VerifyPaymentResponse> {
        try {
            console.log('🔍 Verifying payment:', orderCode);

            const response = await apiClient.get(`/payment/verify/${orderCode}`);

            console.log('✅ Payment verified:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Verify payment error:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Không thể xác minh thanh toán. Vui lòng thử lại.'
            );
        }
    }

    static async getPaymentHistory(bookingId: number): Promise<PaymentHistoryResponse> {
        try {
            console.log('📜 Getting payment history for booking:', bookingId);

            const response = await apiClient.get(`/payment/history/${bookingId}`);

            console.log('✅ Payment history retrieved:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get payment history error:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Không thể lấy lịch sử thanh toán. Vui lòng thử lại.'
            );
        }
    }

    static parsePaymentInfo(notes: string): {
        depositOrderCode: string | null;
        checkoutOrderCode: string | null;
        transactions: {
            type: 'DEPOSIT' | 'CHECKOUT';
            orderCode: string;
            transactionId: string;
            amount: string;
            time: string;
            status: 'success' | 'cancelled';
        }[];
    } {
        const result = {
            depositOrderCode: null as string | null,
            checkoutOrderCode: null as string | null,
            transactions: [] as {
                type: 'DEPOSIT' | 'CHECKOUT';
                orderCode: string;
                transactionId: string;
                amount: string;
                time: string;
                status: 'success' | 'cancelled';
            }[],
        };

        if (!notes) return result;

        const depositOrderCodeMatch = notes.match(/\[PAYOS_ORDER_CODE:(\d+)\]/);
        if (depositOrderCodeMatch) {
            result.depositOrderCode = depositOrderCodeMatch[1];
        }

        const checkoutOrderCodeMatch = notes.match(/\[PAYOS_CHECKOUT_ORDER_CODE:(\d+)\]/);
        if (checkoutOrderCodeMatch) {
            result.checkoutOrderCode = checkoutOrderCodeMatch[1];
        }

        const depositSuccessMatches = notes.matchAll(
            /\[PAYMENT_SUCCESS:\s*(\d+)\s*\|\s*TxID:\s*([^\|]+)\s*\|\s*Amount:\s*(\d+)\s*\|\s*Time:\s*([^\]]+)\]/g
        );
        for (const match of depositSuccessMatches) {
            result.transactions.push({
                type: 'DEPOSIT',
                orderCode: match[1],
                transactionId: match[2].trim(),
                amount: match[3],
                time: match[4].trim(),
                status: 'success',
            });
        }

        const checkoutSuccessMatches = notes.matchAll(
            /\[CHECKOUT_PAYMENT_SUCCESS:\s*(\d+)\s*\|\s*TxID:\s*([^\|]+)\s*\|\s*Amount:\s*(\d+)\s*\|\s*Time:\s*([^\]]+)\]/g
        );
        for (const match of checkoutSuccessMatches) {
            result.transactions.push({
                type: 'CHECKOUT',
                orderCode: match[1],
                transactionId: match[2].trim(),
                amount: match[3],
                time: match[4].trim(),
                status: 'success',
            });
        }

        const depositCancelMatches = notes.matchAll(
            /\[PAYMENT_CANCELLED:\s*(\d+)\s*\|\s*Time:\s*([^\]]+)\]/g
        );
        for (const match of depositCancelMatches) {
            result.transactions.push({
                type: 'DEPOSIT',
                orderCode: match[1],
                transactionId: '',
                amount: '0',
                time: match[2].trim(),
                status: 'cancelled',
            });
        }

        const checkoutCancelMatches = notes.matchAll(
            /\[CHECKOUT_PAYMENT_CANCELLED:\s*(\d+)\s*\|\s*Time:\s*([^\]]+)\]/g
        );
        for (const match of checkoutCancelMatches) {
            result.transactions.push({
                type: 'CHECKOUT',
                orderCode: match[1],
                transactionId: '',
                amount: '0',
                time: match[2].trim(),
                status: 'cancelled',
            });
        }

        return result;
    }

    static formatCurrency(amount: number): string {
        return amount.toLocaleString('vi-VN') + ' VNĐ';
    }

    static isFullyPaid(paidAmount: number, totalAmount: number): boolean {
        return paidAmount >= totalAmount;
    }

    static getRemainingAmount(paidAmount: number, totalAmount: number): number {
        const remaining = totalAmount - paidAmount;
        return remaining > 0 ? remaining : 0;
    }
}


export const createDepositPayment = PaymentService.createDepositPayment;
export const createCheckoutPayment = PaymentService.createCheckoutPayment;
export const verifyPayment = PaymentService.verifyPayment;
export const getPaymentHistory = PaymentService.getPaymentHistory;
export const parsePaymentInfo = PaymentService.parsePaymentInfo;
export const formatCurrency = PaymentService.formatCurrency;
export const isFullyPaid = PaymentService.isFullyPaid;
export const getRemainingAmount = PaymentService.getRemainingAmount;

export default PaymentService;