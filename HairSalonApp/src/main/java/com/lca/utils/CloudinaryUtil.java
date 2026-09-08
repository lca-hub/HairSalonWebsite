package com.lca.utils;

public final class CloudinaryUtil {

    private CloudinaryUtil() {}

    public static String thumbnail(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank() || !imageUrl.contains("/upload/"))
            return imageUrl;
        return imageUrl.replace("/upload/", "/upload/w_400,h_400,c_fill,q_auto,f_auto/");
    }
}