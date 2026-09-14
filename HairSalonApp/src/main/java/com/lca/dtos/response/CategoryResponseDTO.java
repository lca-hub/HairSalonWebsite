package com.lca.dtos.response;

import com.lca.enums.CategoryType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryResponseDTO {

    private Long id;

    private String name;

    private String description;

    private CategoryType type;
}