<?php

namespace App\model;


class UploadModel
{

  public $header;

  public $parameter;

  public $data;
  //
  public function __construct($arrayBuffer)
  {

    // $data = file_get_contents("php://input");

    //   // unpack("C*",$data)
    //   $content =  new UploadModel(unpack("C*",$data));
    
    $_header = array_slice($arrayBuffer,0,16);

    $_header_buffer = pack("C*",...$_header);

    $_header_value = (int)$_header_buffer;
    $this -> header = $_header_value;

    $_parameter = array_slice($arrayBuffer,16,(count($arrayBuffer) - $_header_value - 16));

    $_parameter_buffer = pack("C*",...$_parameter);

    try {
      $_parameter_value = json_decode($_parameter_buffer,true);
    } catch (\Throwable $th) {
      $_parameter_value = '';
    }

    $this -> parameter = $_parameter_value;

    $_data = array_slice($arrayBuffer,count($arrayBuffer) - $_header_value,count($arrayBuffer));
    $_data_buffer =  pack("C*",...$_data);
    $_data_value = $_data_buffer;

    $this -> data = $_data_value;
  }

}
