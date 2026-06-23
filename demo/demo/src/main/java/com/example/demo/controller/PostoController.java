package com.example.demo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.demo.dto.PostoDTO;
import com.example.demo.annotations.Admin;
import com.example.demo.service.PostoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/postos")
public class PostoController extends BaseController<PostoDTO> {

    private PostoService service;
    
    protected PostoController(PostoService service){
        super(service);

        this.service = service;
    }

    @Override
    @Admin
    @PostMapping
    public PostoDTO create(@RequestBody @Valid PostoDTO dto){
        return super.create(dto);
    }

    @Override
    @Admin
    @PutMapping("{id}")
    public PostoDTO update(@PathVariable Long id, @RequestBody @Valid PostoDTO dto){
        return super.update(id,dto);
    }

    @Override
    @Admin
    @DeleteMapping("{id}")
    public void delete(@PathVariable Long id){
        super.delete(id);
    }
}
