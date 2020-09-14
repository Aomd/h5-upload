

public class UploadEntity {
	private Integer header ;
	private String parameter;
	private byte[] data;
	
	public UploadEntity(byte[] bytes){
		header = Integer.parseInt(new String (subByte(bytes,0,16)));
		parameter = new String (subByte(bytes,16,bytes.length - header -16));
		data= subByte(bytes,bytes.length - header,header);
	}
	
	
	public Integer getHeader() {
		return header;
	}


	public String getParameter() {
		return parameter;
	}


	public byte[] getData() {
		return data;
	}


	private byte[] subByte(byte[] b,int off,int length){
		byte[] b1 = new byte[length];
		System.arraycopy(b, off, b1, 0, length);
		return b1;
	}
}
