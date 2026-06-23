package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.dto.PostoDTO;
import com.example.demo.entity.Posto;
import com.example.demo.repository.PostoRepository;

@Service
public class PostoService extends BaseService<Posto, PostoDTO> {

    private PostoRepository repository;

    protected PostoService(PostoRepository repository){
        super(repository);

        this.repository = repository;
    }
}
