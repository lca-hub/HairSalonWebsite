package com.lca.service.impl;

import com.lca.dtos.request.CartItemRequestDTO;
import com.lca.dtos.response.CartResponseDTO;
import com.lca.entity.*;
import com.lca.mapper.CartMapper;
import com.lca.repository.CartItemRepository;
import com.lca.repository.CartRepository;
import com.lca.repository.CustomerRepository;
import com.lca.repository.UserRepository;
import com.lca.repository.ProductRepository;
import com.lca.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(String email) {
        return CartMapper.toResponse(getOrCreateCart(getCustomerByEmail(email).getId()));
    }

    @Override
    public CartResponseDTO addItem(String email, CartItemRequestDTO request) {

        Cart cart = getOrCreateCart(getCustomerByEmail(email).getId());

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new RuntimeException("Sản phẩm đã ngừng kinh doanh");
        }

        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new RuntimeException("Sản phẩm đã hết hàng");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId()).orElse(null);

        int quantity = request.getQuantity();

        if (item == null) {

            if (quantity > product.getStockQuantity()) {
                throw new RuntimeException("Số lượng vượt quá tồn kho");
            }

            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setAddedAt(LocalDateTime.now());

            cart.getItems().add(item);

        } else {

            int newQuantity = item.getQuantity() + quantity;

            if (newQuantity > product.getStockQuantity()) {
                throw new RuntimeException("Số lượng vượt quá tồn kho");
            }

            item.setQuantity(newQuantity);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return CartMapper.toResponse(cart);
    }

    @Override
    public CartResponseDTO updateItem(String email, Long productId, CartItemRequestDTO request) {

        Cart cart = getOrCreateCart(getCustomerByEmail(email).getId());

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId).orElseThrow(
                () -> new RuntimeException("Sản phẩm không có trong giỏ hàng"));

        Product product = item.getProduct();

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new RuntimeException("Sản phẩm đã ngừng kinh doanh");
        }

        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }

        if (product.getStockQuantity() == null || request.getQuantity() > product.getStockQuantity()) {
            throw new RuntimeException("Số lượng vượt quá tồn kho");
        }

        item.setQuantity(request.getQuantity());

        cart.setUpdatedAt(LocalDateTime.now());

        cartItemRepository.save(item);
        cartRepository.save(cart);

        return CartMapper.toResponse(cart);
    }

    @Override
    public void removeItem(String email, Long productId) {

        Cart cart = getOrCreateCart(getCustomerByEmail(email).getId());

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng"));

        cart.getItems().remove(item);
        cart.setUpdatedAt(LocalDateTime.now());

        cartItemRepository.delete(item);
    }

    @Override
    public void clearCart(String email) {

        Cart cart = getOrCreateCart(getCustomerByEmail(email).getId());

        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);
    }

    private Customer getCustomerByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        return customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));
    }

    private Cart getOrCreateCart(Long customerId) {

        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {Customer customer = customerRepository.findById(customerId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));

                    Cart cart = new Cart();
                    cart.setCustomer(customer);
                    cart.setCreatedAt(LocalDateTime.now());
                    cart.setUpdatedAt(LocalDateTime.now());

                    return cartRepository.save(cart);
                });
    }
}