package com.lca.service.impl;

import com.lca.dtos.request.ProductOrderRequestDTO;
import com.lca.dtos.response.ProductOrderResponseDTO;
import com.lca.entity.*;
import com.lca.enums.PaymentStatus;
import com.lca.enums.ProductOrderStatus;
import com.lca.mapper.ProductOrderMapper;
import com.lca.repository.*;
import com.lca.service.ProductOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductOrderServiceImpl implements ProductOrderService {

    private final ProductOrderRepository productOrderRepo;
    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final CustomerRepository customerRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    @Override
    public ProductOrderResponseDTO create(String email, ProductOrderRequestDTO request) {
        Customer customer = getCustomerByEmail(email);

        Cart cart = cartRepo.findByCustomerId(customer.getId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy giỏ hàng"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng đang trống");
        }

        ProductOrder order = ProductOrderMapper.toEntity(request);

        order.setCustomer(customer);
        order.setOrderCode(generateOrderCode());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setOrderStatus(ProductOrderStatus.PENDING);

        BigDecimal subTotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepo.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + cartItem.getProduct().getId()));

            if (!Boolean.TRUE.equals(product.getIsActive())) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' hiện không hoạt động");
            }

            if (cartItem.getQuantity() == null || cartItem.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm không hợp lệ");
            }

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' không đủ tồn kho");
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            ProductOrderItem item = new ProductOrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(cartItem.getQuantity());
            item.setUnitPrice(unitPrice);
            item.setTotalPrice(totalPrice);
            item.setProductName(product.getName());

            order.getItems().add(item);
            subTotal = subTotal.add(totalPrice);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal shippingFee = BigDecimal.ZERO;
        BigDecimal totalAmount = subTotal.subtract(discountAmount).add(shippingFee);

        order.setSubTotal(subTotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);

        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        ProductOrder savedOrder = productOrderRepo.save(order);

        cartItemRepo.deleteByCartId(cart.getId());
        cartItemRepo.flush();

        return ProductOrderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductOrderResponseDTO> getMyOrders(String email, Pageable pageable) {
        Customer customer = getCustomerByEmail(email);

        return productOrderRepo.findByCustomerId(customer.getId(), pageable).map(ProductOrderMapper::toResponse);
    }

    @Override
    public void cancel(String email, Long orderId) {
        Customer customer = getCustomerByEmail(email);

        ProductOrder order = productOrderRepo.findById(orderId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Đơn hàng không thuộc customer này");
        }

        if (order.getOrderStatus() == ProductOrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã bị hủy");
        }

        if (order.getOrderStatus() != ProductOrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang ở trạng thái PENDING");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            restoreStock(order);
        }

        order.setOrderStatus(ProductOrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

        productOrderRepo.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductOrderResponseDTO getMyOrderById(String email, Long orderId) {
        Customer customer = getCustomerByEmail(email);

        ProductOrder order = productOrderRepo.findById(orderId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Đơn hàng không thuộc customer này");
        }

        return ProductOrderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductOrderResponseDTO> getAll(Pageable pageable) {
        return productOrderRepo.findAll(pageable).map(ProductOrderMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductOrderResponseDTO getById(Long id) {
        ProductOrder order = productOrderRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy đơn hàng"));

        return ProductOrderMapper.toResponse(order);
    }

    @Override
    public ProductOrderResponseDTO updateStatus(Long id, ProductOrderStatus status) {
        ProductOrder order = productOrderRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy đơn hàng"));

        ProductOrderStatus currentStatus = order.getOrderStatus();

        if (currentStatus == ProductOrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã bị hủy");
        }

        if (currentStatus == ProductOrderStatus.DELIVERED) {
            throw new RuntimeException("Đơn hàng đã giao thành công, không thể cập nhật");
        }

        if (status == null) {
            throw new RuntimeException("Trạng thái đơn hàng không được để trống");
        }

        if (status == ProductOrderStatus.CANCELLED && order.getPaymentStatus() == PaymentStatus.PAID) {
            restoreStock(order);
        }

        order.setOrderStatus(status);
        order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

        return ProductOrderMapper.toResponse(productOrderRepo.save(order));
    }

    @Override
    public void deductStock(Long orderId) {
        ProductOrder order = productOrderRepo.findById(orderId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }

        if (order.getOrderStatus() == ProductOrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã bị hủy");
        }

        for (ProductOrderItem item : order.getItems()) {
            if (item.getProduct() == null) {
                continue;
            }

            Product product = productRepo.findById(item.getProduct().getId()).orElseThrow(
                    () -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + item.getProduct().getId()));

            if (!Boolean.TRUE.equals(product.getIsActive())) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' hiện không hoạt động");
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' không đủ tồn kho");
            }

            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepo.save(product);
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        productOrderRepo.save(order);
    }

    private void restoreStock(ProductOrder order) {
        for (ProductOrderItem item : order.getItems()) {
            if (item.getProduct() == null) {
                continue;
            }

            Product product = productRepo.findById(item.getProduct().getId()).orElseThrow(
                    () -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + item.getProduct().getId()));

            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepo.save(product);
        }
    }

    private String generateOrderCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Customer getCustomerByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user"));

        return customerRepo.findByUserId(user.getId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy customer"));
    }
}