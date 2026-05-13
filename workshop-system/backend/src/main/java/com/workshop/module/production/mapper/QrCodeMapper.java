package com.workshop.module.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workshop.module.production.entity.QrCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface QrCodeMapper extends BaseMapper<QrCode> {

    List<QrCode> pageQuery(@Param("offset") long offset,
                           @Param("size") long size,
                           @Param("orderItemId") Long orderItemId,
                           @Param("productId") Long productId,
                           @Param("status") Integer status);

    long countQuery(@Param("orderItemId") Long orderItemId,
                    @Param("productId") Long productId,
                    @Param("status") Integer status);
}
