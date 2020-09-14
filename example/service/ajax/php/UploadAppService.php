<?php

namespace App\Http\Controllers\www\api\system;

use Illuminate\Support\Facades\Storage;

class UploadAppService
{

    public $header;

    public $parameter;

    public $data;

    /**
     * 解析arrayBuffer
     *
     * @Author Aomd g00665@163.com
     * @DateTime 2020-05-16
     * @param [type] $arrayBuffer
     * @return void
     */
    public function done(array $arrayBuffer)
    {

        // $data = file_get_contents("php://input");

        //   // unpack("C*",$data)
        //   $content =  new UploadModel(unpack("C*",$data));

        $_header = array_slice($arrayBuffer, 0, 16);

        $_header_buffer = pack("C*", ...$_header);

        $_header_value = (int) $_header_buffer;
        $this->header = $_header_value;

        $_parameter = array_slice($arrayBuffer, 16, (count($arrayBuffer) - $_header_value - 16));

        $_parameter_buffer = pack("C*", ...$_parameter);

        try {
            $_parameter_value = json_decode($_parameter_buffer, true);
        } catch (\Throwable $th) {
            $_parameter_value = '';
        }

        $this->parameter = $_parameter_value;

        $_data = array_slice($arrayBuffer, count($arrayBuffer) - $_header_value, count($arrayBuffer));
        $_data_buffer =  pack("C*", ...$_data);
        $_data_value = $_data_buffer;

        $this->data = $_data_value;
    }

    /**
     * 写文件
     *
     * @Author Aomd g00665@163.com
     * @DateTime 2020-05-16
     * @return void
     */
    public function writeFile($fileName)
    {
        # code...
        Storage::disk('publicApp')->put('temp' . DIRECTORY_SEPARATOR . $fileName, $this->data);
    }

    /**
     * 合并文件
     *
     * @Author Aomd g00665@163.com
     * @DateTime 2020-05-16
     * @return void
     */
    public function concatFile($entity)
    {
        $fileName = $entity->parameter['key'] . '.' . $entity->parameter['extname'];

        Storage::disk('publicApp')->delete($fileName);

        $path = public_path('app' . DIRECTORY_SEPARATOR . 'temp');
        if (is_dir($path)) {
            $files = scandir($path);
        } else {
            $files = [];
        }


        $file_name = $entity->parameter['key'] . '.' . $entity->parameter['extname'];
        $fileOpen = fopen(public_path('app' . DIRECTORY_SEPARATOR . $file_name), 'a');

        $this->forWrite(1, $entity, $files, $fileOpen);

        fclose($fileOpen);
        # code...
    }

    /**
     * 递归写文件
     *
     * @Author Aomd g00665@163.com
     * @DateTime 2020-05-16
     * @return void
     */
    public function forWrite($start, $entity, $files, $fileOpen)
    {

        try {

            $temp_name = $entity->parameter['extname'] . '-' . $entity->parameter['key'] . '-' . $start . '.temp';

            //     if($value == $temp_name){
            //         $path = public_path('app' . DIRECTORY_SEPARATOR . 'temp'.DIRECTORY_SEPARATOR.$temp_name);

            //         fwrite($fileOpen, readfile($path));
            //     }
            // }
            if (in_array($temp_name, $files)) {
                $path = public_path('app' . DIRECTORY_SEPARATOR . 'temp'.DIRECTORY_SEPARATOR.$temp_name);
                // file_put_contents($path,readfile($path),FILE_APPEND);
                fwrite($fileOpen, file_get_contents($path));

                if($start < $entity->parameter['totol_chunk']){

                    $start+=1;

                    $this -> forWrite($start, $entity, $files, $fileOpen);
                }else{
                    $this -> delTemp($files, $entity);
                }
            }

        } catch (\Throwable $th) {
            fclose($fileOpen);
        }
    }

    /**
     * 删除零时文件
     *
     * @Author Aomd g00665@163.com
     * @DateTime 2020-05-16
     * @return void
     */
    public function delTemp($files, $entity)
    {
        # code...
        $path = public_path('app' . DIRECTORY_SEPARATOR . 'temp');

        foreach ($files as $key => $value) {
            if(strpos($value,$entity->parameter['extname'].'-'.$entity->parameter['key']) > -1){
                Storage::disk('publicApp')->delete('temp'.DIRECTORY_SEPARATOR.$value);
            }
            // $value.include($entity->parameter['extname'].'-'.$entity->parameter['key']);
            // // if(in_array()){

            // // }
        }
    }
}
