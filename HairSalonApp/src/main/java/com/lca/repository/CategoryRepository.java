package com.lca.repository;

import com.lca.entity.Category;
import com.lca.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndType(String name, CategoryType type);

    List<Category> findByType(CategoryType type);
}