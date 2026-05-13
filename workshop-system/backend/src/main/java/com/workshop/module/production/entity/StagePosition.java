package com.workshop.module.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("stage_position")
public class StagePosition {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long stageId;
    private Long positionId;
    private LocalDateTime createdAt;
}
