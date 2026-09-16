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
import java.util.ArrayList;
import java.util.List;
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
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy sản phẩm với ID: " + cartItem.getProduct().getId()));

            if (!Boolean.TRUE.equals(product.getIsActive())) {
                throw new RuntimeException(
                        "Sản phẩm '" + product.getName() + "' hiện không hoạt động");
            }

            if (cartItem.getQuantity() == null || cartItem.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm không hợp lệ");
            }

            if (product.getStockQuantity() == null || product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Sản phẩm '" + product.getName() + "' không đủ tồn kho");
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal totalPrice = unitPrice.multiply(
                    BigDecimal.valueOf(cartItem.getQuantity()));

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

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Tổng tiền không hợp lệ");
        }

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
    public ProductOrderResponseDTO createAtStore(ProductOrderRequestDTO request) {

        if (request.getCustomerId() == null) {
            throw new RuntimeException("Khách hàng không được để trống");
        }

        Customer customer = customerRepo.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy khách hàng với ID: " + request.getCustomerId()));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm không được để trống");
        }

        if (request.getPaymentMethod() == null) {
            throw new RuntimeException("Phương thức thanh toán không được để trống");
        }

        if (request.getReceiverName() == null || request.getReceiverName().isBlank()) {
            throw new RuntimeException("Tên người nhận không được để trống");
        }

        if (request.getReceiverPhone() == null || request.getReceiverPhone().isBlank()) {
            throw new RuntimeException("Số điện thoại người nhận không được để trống");
        }

        if (request.getShippingAddress() == null || request.getShippingAddress().isBlank()) {
            throw new RuntimeException("Địa chỉ không được để trống");
        }

        BigDecimal subTotal = BigDecimal.ZERO;

        ProductOrder order = new ProductOrder();

        order.setCustomer(customer);
        order.setOrderCode(generateOrderCode());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setOrderStatus(ProductOrderStatus.PENDING);
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setNote(request.getNote());
        order.setDiscountAmount(
                request.getDiscountAmount() == null
                        ? BigDecimal.ZERO
                        : request.getDiscountAmount());
        order.setShippingFee(BigDecimal.ZERO);

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);

        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        List<ProductOrderItem> orderItems = new ArrayList<>();

        for (ProductOrderRequestDTO.ProductOrderItemRequestDTO itemRequest : request.getItems()) {

            if (itemRequest.getProductId() == null) {
                throw new RuntimeException("Sản phẩm không được để trống");
            }

            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm phải lớn hơn 0");
            }

            Product product = productRepo.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy sản phẩm với ID: " + itemRequest.getProductId()));

            if (!Boolean.TRUE.equals(product.getIsActive())) {
                throw new RuntimeException(
                        "Sản phẩm '" + product.getName() + "' không còn kinh doanh");
            }

            if (product.getStockQuantity() == null
                    || product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException(
                        "Sản phẩm '" + product.getName() + "' không đủ tồn kho");
            }

            BigDecimal unitPrice = product.getPrice();

            BigDecimal itemTotal = unitPrice.multiply(
                    BigDecimal.valueOf(itemRequest.getQuantity()));

            ProductOrderItem orderItem = new ProductOrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(itemTotal);
            orderItem.setProductName(product.getName());

            orderItems.add(orderItem);

            subTotal = subTotal.add(itemTotal);
        }

        BigDecimal discountAmount = request.getDiscountAmount() == null
                ? BigDecimal.ZERO
                : request.getDiscountAmount();

        if (discountAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giảm giá không hợp lệ");
        }

        if (discountAmount.compareTo(subTotal) > 0) {
            throw new RuntimeException("Giảm giá không được lớn hơn tạm tính");
        }

        BigDecimal shippingFee = BigDecimal.ZERO;

        BigDecimal totalAmount = subTotal
                .subtract(discountAmount)
                .add(shippingFee);

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Tổng tiền không hợp lệ");
        }

        order.setSubTotal(subTotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        ProductOrder savedOrder = productOrderRepo.saveAndFlush(order);

        return ProductOrderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductOrderResponseDTO> getMyOrders(String email, Pageable pageable) {

        Customer customer = getCustomerByEmail(email);

        return productOrderRepo.findByCustomerId(
                customer.getId(),
                pageable
        ).map(ProductOrderMapper::toResponse);
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
            throw new RuntimeException(
                    "Chỉ có thể hủy đơn hàng đang ở trạng thái PENDING");
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
        return productOrderRepo.findAll(pageable)
                .map(ProductOrderMapper::toResponse);
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
            throw new RuntimeException(
                    "Đơn hàng đã giao thành công, không thể cập nhật");
        }

        if (status == null) {
            throw new RuntimeException(
                    "Trạng thái đơn hàng không được để trống");
        }

        if (status == ProductOrderStatus.CANCELLED
                && order.getPaymentStatus() == PaymentStatus.PAID) {

            restoreStock(order);
        }

        order.setOrderStatus(status);
        order.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

        return ProductOrderMapper.toResponse(
                productOrderRepo.save(order)
        );
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

            if (product.getStockQuantity() == null || product.getStockQuantity() < item.getQuantity()) {

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

        if (order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }

        for (ProductOrderItem item : order.getItems()) {

            if (item.getProduct() == null) {
                continue;
            }

            Product product = productRepo.findById(item.getProduct().getId()).orElseThrow(
                    () -> new RuntimeException(
                            "Không tìm thấy sản phẩm với ID: "
                                    + item.getProduct().getId()));

            int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();

            product.setStockQuantity(currentStock + item.getQuantity());
            productRepo.save(product);
        }
    }

    private String generateOrderCode() {
        return "ORD-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    private Customer getCustomerByEmail(String email) {

        User user = userRepo.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user"));

        return customerRepo.findByUserId(user.getId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy customer"));
    }
}