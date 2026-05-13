package com.workshop.module.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.exception.BusinessException;
import com.workshop.common.utils.CodeGenerator;
import com.workshop.module.order.dto.OrderCreateDTO;
import com.workshop.module.order.dto.OrderItemCreateDTO;
import com.workshop.module.order.dto.OrderPageDTO;
import com.workshop.module.order.entity.Order;
import com.workshop.module.order.entity.OrderFile;
import com.workshop.module.order.entity.OrderItem;
import com.workshop.module.order.mapper.OrderFileMapper;
import com.workshop.module.order.mapper.OrderItemMapper;
import com.workshop.module.order.mapper.OrderMapper;
import com.workshop.module.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private OrderFileMapper orderFileMapper;

    @Autowired
    private CodeGenerator codeGenerator;

    @Override
    public Page<Order> pageQuery(Page<Order> page, OrderPageDTO dto) {
        long offset = (page.getCurrent() - 1) * page.getSize();

        List<Order> records = orderMapper.pageQuery(offset, page.getSize(),
                dto.getOrderNo(), dto.getCustomerName(), dto.getStatus(),
                dto.getStartDate(), dto.getEndDate());
        long total = orderMapper.countQuery(dto.getOrderNo(), dto.getCustomerName(),
                dto.getStatus(), dto.getStartDate(), dto.getEndDate());

        page.setRecords(records);
        page.setTotal(total);
        return page;
    }

    @Override
    public Map<String, Object> getDetail(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }

        List<OrderItem> items = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, id)
        );

        List<OrderFile> files = orderFileMapper.selectList(
                new LambdaQueryWrapper<OrderFile>().eq(OrderFile::getOrderId, id)
        );

        Map<String, Object> detail = new HashMap<>();
        detail.put("order", order);
        detail.put("items", items);
        detail.put("files", files);
        return detail;
    }

    @Override
    @Transactional
    public void create(OrderCreateDTO dto, Long userId) {
        // 校验必填字段
        if (!StringUtils.hasText(dto.getCustomerName())) {
            throw new BusinessException(400, "客户名称不能为空");
        }

        Order order = new Order();
        order.setOrderNo(codeGenerator.generateOrderNo());
        order.setCustomerName(dto.getCustomerName());
        order.setCustomerContact(dto.getCustomerContact());
        order.setCustomerPhone(dto.getCustomerPhone());
        order.setCustomerAddress(dto.getCustomerAddress());
        // orderDate 兜底：如果前端未传，默认当前时间
        order.setOrderDate(dto.getOrderDate() != null ? dto.getOrderDate() : LocalDateTime.now());
        order.setDeliveryDate(dto.getDeliveryDate());
        order.setTotalAmount(dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO);
        order.setRemark(dto.getRemark());
        order.setStatus(0); // PENDING
        order.setCreatedBy(userId);

        orderMapper.insert(order);

        // Save order items
        if (dto.getItems() != null) {
            for (OrderItemCreateDTO itemDto : dto.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrderId(order.getId());
                item.setProductId(itemDto.getProductId());
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : BigDecimal.ZERO);
                item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                item.setProductionStatus(0); // PENDING
                orderItemMapper.insert(item);
            }
        }
    }

    @Override
    public void update(Order order) {
        Order existing = orderMapper.selectById(order.getId());
        if (existing == null) {
            throw new BusinessException(404, "订单不存在");
        }
        order.setOrderNo(existing.getOrderNo()); // Don't change order number
        orderMapper.updateById(order);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }
        order.setStatus(status);
        orderMapper.updateById(order);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }
        // Delete related items and files
        orderItemMapper.delete(new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, id));
        orderFileMapper.delete(new LambdaQueryWrapper<OrderFile>().eq(OrderFile::getOrderId, id));
        orderMapper.deleteById(id);
    }
}
