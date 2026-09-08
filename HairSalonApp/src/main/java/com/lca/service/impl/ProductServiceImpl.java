package com.lca.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lca.dtos.request.ProductRequestDTO;
import com.lca.dtos.response.ProductResponseDTO;
import com.lca.entity.Category;
import com.lca.entity.Product;
import com.lca.entity.Supplier;
import com.lca.mapper.ProductMapper;
import com.lca.repository.CategoryRepository;
import com.lca.repository.ProductRepository;
import com.lca.repository.SupplierRepository;
import com.lca.service.ProductService;
import com.lca.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final CategoryRepository categoryRepository;
    private final Cloudinary cloudinary;

    @Override
    public ProductResponseDTO create(ProductRequestDTO request, MultipartFile image) {
        if (productRepository.existsByProductCode(request.getProductCode()))
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + request.getProductCode());

        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy supplier với ID: " + request.getSupplierId()));
        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy category với ID: " + request.getCategoryId()));

        Product product = ProductMapper.toEntity(request);
        product.setSupplier(supplier);
        product.setCategory(category);

        if (image != null && !image.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap("folder", "hair-salon/products"));
                product.setImageUrl((String) uploadResult.get("secure_url"));
            } catch (Exception e) {
                throw new RuntimeException("Upload ảnh sản phẩm thất bại", e);
            }
        }

        Product saved = productRepository.save(product);
        return ProductMapper.toResponse(saved);
    }

    @Override
    public ProductResponseDTO update(Long id, ProductRequestDTO request, MultipartFile image) {
        Product product = productRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));

        if (request.getProductCode() != null &&
                !request.getProductCode().equals(product.getProductCode()) &&
                productRepository.existsByProductCode(request.getProductCode()))
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + request.getProductCode());

        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy supplier với ID: " + request.getSupplierId()));
        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy category với ID: " + request.getCategoryId()));

        ProductMapper.updateEntity(product, request);
        product.setSupplier(supplier);
        product.setCategory(category);

        if (image != null && !image.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap("folder", "hair-salon/products"));
                product.setImageUrl((String) uploadResult.get("secure_url"));
            } catch (Exception e) {
                throw new RuntimeException("Upload ảnh sản phẩm thất bại", e);
            }
        }

        Product updated = productRepository.save(product);
        return ProductMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        return ProductMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(ProductMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getActiveProducts(Pageable pageable) {
        return productRepository.findAll(ProductSpecification.isActive(), pageable).map(ProductMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> search(String keyword, Long categoryId, Long supplierId, Pageable pageable) {
        Specification<Product> specification = Specification.where(ProductSpecification.isActive()).and(ProductSpecification.keyword(keyword)).and(ProductSpecification.categoryId(categoryId)).and(ProductSpecification.supplierId(supplierId));
        return productRepository.findAll(specification, pageable).map(ProductMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getBySupplier(Long supplierId, Pageable pageable) {
        Specification<Product> specification = Specification.where(ProductSpecification.isActive()).and(ProductSpecification.supplierId(supplierId));
        return productRepository.findAll(specification, pageable).map(ProductMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getByCategory(Long categoryId, Pageable pageable) {
        Specification<Product> specification = Specification.where(ProductSpecification.isActive()).and(ProductSpecification.categoryId(categoryId));
        return productRepository.findAll(specification, pageable).map(ProductMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getLowStockProducts(Pageable pageable) {
        Specification<Product> specification = (root, query, cb) -> cb.and(cb.isTrue(root.get("isActive")), cb.lessThanOrEqualTo(root.get("stockQuantity"), root.get("minStockAlert")));
        return productRepository.findAll(specification, pageable).map(ProductMapper::toResponse);
    }

    @Override
    public ProductResponseDTO updateStatus(Long id, Boolean isActive) {
        Product product = productRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        product.setIsActive(isActive);
        Product updated = productRepository.save(product);
        return ProductMapper.toResponse(updated);
    }
}