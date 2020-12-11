package nsfcovid19.cwru.parsers;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class VCFFileFormat {
	private static final String FILEVERSION = "VCFv4.2";
	private static final String format_header = "fileformat=" + FILEVERSION;
	private static final SimpleDateFormat ft = new SimpleDateFormat ("yyyyMMdd");
	private static final String date_header = "fileDate=" + formatDate();
	private static final String source_header = "edu.cwru.covid19.VCFProgram";
	private static final List<String> INFO_DT = defineDatatypes();
	private static final String chrom_tag = "CHROM";
	private static final String pos_tag = "POS";
	private static final String id_tag = "ID";
	private static final String ref_tag = "REF";
	private static final String alt_tag = "ALT";
	private static final String qual_tag = "QUAL";
	private static final String filter_tag = "FILTER";
	private static final String info_tag = "INFO";
	private static final String format_tag = "FORMAT";
	private static final String genotype_tag = "GENOTYPES";
	
	private static final String format_value = "GT";

	// standard line item values
	public static final String STD_CHROM = "NC_045512.2";
	public static final String EMPTY_VALUE = ".";
	
	
	private static String formatDate() {
		Date date = new Date();
		return ft.format(date);
	}

	static List<String> getMetaData() {
		List<String> md = new ArrayList<String>();
		md.add(format_header);
		md.add(date_header);
		md.add(source_header);
		for (String dt : INFO_DT) {
			md.add(dt);
		}
		return md;
	}

	static List<String> defineDatatypes() {
		// currently only define TVN
		List<String> dts = new ArrayList<String>();
		String str = "INFO=<ID=TVN,Number=1,Type=Integer,Description=\"Number of Samples With Specific SNP\">";
		dts.add(str);
		return dts;
	}
	
	static List<String> getTags() {
		List<String> tags = new ArrayList<String>();
		tags.add(chrom_tag);
		tags.add(pos_tag);
		tags.add(id_tag);
		tags.add(ref_tag);
		tags.add(alt_tag);
		tags.add(qual_tag);
		tags.add(filter_tag);
		tags.add(info_tag);
		tags.add(format_tag);
		tags.add(genotype_tag);
		return tags;
	}

	static String getFormat() {
		return format_value;
	}
}
