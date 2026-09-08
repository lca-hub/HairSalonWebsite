package com.lca.service.impl;

import com.lca.dtos.request.CartItemRequestDTO;
import com.lca.dtos.response.CartResponseDTO;
import com.lca.entity.Cart;
import com.lca.entity.CartItem;
import com.lca.entity.Customer;
import com.lca.entity.Product;
import com.lca.mapper.CartMapper;
import com.lca.repository.CartItemRepository;
import com.lca.repository.CartRepository;
import com.lca.repository.CustomerRepository;
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
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(Long customerId) {
        return CartMapper.toResponse(getOrCreateCart(customerId));
    }

    @Override
    public CartResponseDTO addItem(Long customerId, CartItemRequestDTO request) {

        Cart cart = getOrCreateCart(customerId);

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
    public CartResponseDTO updateItem(Long customerId, Long productId, CartItemRequestDTO request) {

        Cart cart = getOrCreateCart(customerId);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng"));

        Product product = item.getProduct();

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new RuntimeException("Sản phẩm đã ngừng kinh doanh");
        }

        if (request.getQuantity() > product.getStockQuantity()) {
            throw new RuntimeException("Số lượng vượt quá tồn kho");
        }

        item.setQuantity(request.getQuantity());
        cart.setUpdatedAt(LocalDateTime.now());

        return CartMapper.toResponse(cart);
    }

    @Override
    public void removeItem(Long customerId, Long productId) {

        Cart cart = getOrCreateCart(customerId);

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() ->
                        new RuntimeException("Sản phẩm không có trong giỏ hàng"));

        cart.getItems().remove(item);
        cart.setUpdatedAt(LocalDateTime.now());

        cartItemRepository.delete(item);
    }

    @Override
    public void clearCart(Long customerId) {

        Cart cart = getOrCreateCart(customerId);

        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);
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