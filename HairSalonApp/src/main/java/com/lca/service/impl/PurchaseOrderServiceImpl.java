package com.lca.service.impl;

import com.lca.dtos.request.PurchaseOrderRequestDTO;
import com.lca.dtos.response.PurchaseOrderResponseDTO;
import com.lca.entity.Product;
import com.lca.entity.PurchaseOrder;
import com.lca.entity.PurchaseOrderItem;
import com.lca.entity.Supplier;
import com.lca.mapper.PurchaseOrderMapper;
import com.lca.repository.ProductRepository;
import com.lca.repository.PurchaseOrderRepository;
import com.lca.repository.SupplierRepository;
import com.lca.service.PurchaseOrderService;
import com.lca.specification.PurchaseOrderSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @Override
    public PurchaseOrderResponseDTO create(PurchaseOrderRequestDTO request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + request.getSupplierId()));

        PurchaseOrder purchaseOrder = PurchaseOrderMapper.toEntity(request);
        purchaseOrder.setSupplier(supplier);
        purchaseOrder.setOrderDate(LocalDateTime.now());
        purchaseOrder.setIsReceived(false);
        purchaseOrder.setTotalAmount(BigDecimal.ZERO);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderRequestDTO.Item itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId()).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + itemRequest.getProductId()));

            if (product.getSupplier() != null && !product.getSupplier().getId().equals(supplier.getId())) throw new RuntimeException("Sản phẩm " + product.getName() + " không thuộc nhà cung cấp đã chọn");

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(purchaseOrder);
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setImportPrice(itemRequest.getImportPrice());

            purchaseOrder.getItems().add(item);

            totalAmount = totalAmount.add(itemRequest.getImportPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }

        purchaseOrder.setTotalAmount(totalAmount);

        return PurchaseOrderMapper.toResponse(purchaseOrderRepository.save(purchaseOrder));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponseDTO> getAll(Pageable pageable) {
        return purchaseOrderRepository.findAll(pageable).map(PurchaseOrderMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponseDTO getById(Long id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + id));
        return PurchaseOrderMapper.toResponse(purchaseOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponseDTO> getBySupplier(Long supplierId, Pageable pageable) {
        if (!supplierRepository.existsById(supplierId)) throw new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + supplierId);
        return purchaseOrderRepository.findBySupplierId(supplierId, pageable).map(PurchaseOrderMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponseDTO> getByReceived(Boolean received, Pageable pageable) {
        return purchaseOrderRepository.findByIsReceived(received, pageable).map(PurchaseOrderMapper::toResponse);
    }

    @Override
    public PurchaseOrderResponseDTO update(Long id, PurchaseOrderRequestDTO request) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + id));

        if (Boolean.TRUE.equals(purchaseOrder.getIsReceived())) throw new RuntimeException("Không thể sửa phiếu nhập đã nhập kho");

        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + request.getSupplierId()));

        purchaseOrder.setSupplier(supplier);
        purchaseOrder.setNote(request.getNote());
        purchaseOrder.getItems().clear();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderRequestDTO.Item itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId()).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + itemRequest.getProductId()));

            if (product.getSupplier() != null && !product.getSupplier().getId().equals(supplier.getId())) throw new RuntimeException("Sản phẩm " + product.getName() + " không thuộc nhà cung cấp đã chọn");

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(purchaseOrder);
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setImportPrice(itemRequest.getImportPrice());

            purchaseOrder.getItems().add(item);

            totalAmount = totalAmount.add(itemRequest.getImportPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }

        purchaseOrder.setTotalAmount(totalAmount);

        return PurchaseOrderMapper.toResponse(purchaseOrderRepository.save(purchaseOrder));
    }

    @Override
    public PurchaseOrderResponseDTO receive(Long id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + id));

        if (Boolean.TRUE.equals(purchaseOrder.getIsReceived())) throw new RuntimeException("Phiếu nhập này đã được nhập kho trước đó");

        if (purchaseOrder.getItems() == null || purchaseOrder.getItems().isEmpty()) throw new RuntimeException("Phiếu nhập không có sản phẩm");

        for (PurchaseOrderItem item : purchaseOrder.getItems()) {
            Product product = item.getProduct();

            int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();

            product.setStockQuantity(currentStock + item.getQuantity());

            productRepository.save(product);
        }

        purchaseOrder.setIsReceived(true);

        return PurchaseOrderMapper.toResponse(purchaseOrderRepository.save(purchaseOrder));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponseDTO> search(Long supplierId, Boolean isReceived, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Specification<PurchaseOrder> specification = Specification.where(PurchaseOrderSpecification.supplierId(supplierId))
                .and(PurchaseOrderSpecification.isReceived(isReceived))
                .and(PurchaseOrderSpecification.orderDateFrom(from))
                .and(PurchaseOrderSpecification.orderDateTo(to));
        return purchaseOrderRepository.findAll(specification, pageable).map(PurchaseOrderMapper::toResponse);
    }
}