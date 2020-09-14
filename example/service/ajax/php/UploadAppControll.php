<?php

namespace App\Http\Controllers\www\api\system;

use App\Http\Controllers\Controller;

class UploadAppControll extends Controller
{
    private $uploadAppService;


    public function __construct()
    {
        $this->uploadAppService = new UploadAppService();
    }

    //
    public function upload()
    {

        $data = file_get_contents('php://input');


        if ($data) {
            $entity = $this->uploadAppService;
            $entity->done(unpack("C*", $data));
            if($entity->parameter['extname'] != 'apk'){
                return response('格式错误', 401);
            }
            $fileName = $entity->parameter['extname'] . '-' . $entity->parameter['key'] . '-' . $entity->parameter['current_chunk'] . '.temp';
            // 判断当前块
            if ($entity->parameter['current_chunk']  < $entity->parameter['totol_chunk']) {
                $entity->parameter['type'] = 'progress';


                

                // 写文件
                $entity->writeFile($fileName);

                return $entity->parameter;
            } else if ($entity->parameter['current_chunk']  = $entity->parameter['totol_chunk']) {
                $entity->parameter['type'] = 'success';

                $entity->writeFile($fileName);

                $entity ->concatFile($entity);
                // 合并文件
                return $entity->parameter;
            }
        } else {
            return response('格式错误', 401);
        }
    }
}
