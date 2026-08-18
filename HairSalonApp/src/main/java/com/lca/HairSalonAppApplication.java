package com.lca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.awt.Desktop;
import java.net.URI;

@SpringBootApplication
public class HairSalonAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(HairSalonAppApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void openBrowser() {

        try {
            String url = "http://localhost:8080/admin/login";

            if (Desktop.isDesktopSupported()) {

                Desktop.getDesktop().browse(new URI(url));

            } else {
                Runtime.getRuntime().exec(new String[]{"cmd", "/c", "start", "", url});
            }

        } catch (Exception e) {

            e.printStackTrace();
        }
    }
}