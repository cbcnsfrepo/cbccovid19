package nsfcovid19.cwru.parsers;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

import javax.swing.JFileChooser;

public class Utilities {
	private static final Logger LOGGER = Logger.getGlobal();

	private static final String samples = "getSamples";

	private static final String snp_rgex = ">";

	public static List<String> pos;
	public static List<Integer> snps;
	public static List<Integer> numberVariants;
	public static List<List<String>> sampleSNP;
	private static String path;

	private static String last_pos = "";
	private static int last_pointer = 0;

	static boolean matchSNP(List<String> pos, List<Integer> num_snp) {
		if (pos.size() != num_snp.size()) {
			return false;
		}
		return true;
	}

	static String getLineItem(int index) {
		LOGGER.info(pos.get(index));
		List<String> css_list = new ArrayList<String>();
		css_list.add(pos.get(index));
		last_pos = parsePos(pos.get(index));
		last_pointer = index + 1;
		while (checkRedundancy(last_pointer)) {
			LOGGER.info("has redundancy");
			css_list.add(pos.get(last_pointer));
			last_pointer++;
		}
		String str = concatLine(VCFFileFormat.STD_CHROM, 
				parsePos(pos.get(index)), 
				parseID(css_list, index), 
				parseRefAlt(css_list),
				VCFFileFormat.EMPTY_VALUE,
				VCFFileFormat.EMPTY_VALUE,
				"TVN=" + snps.get(index).toString(),
				VCFFileFormat.getFormat(),
				getGenotype(index));
		LOGGER.info(str);
		return str;
	}

	private static String getGenotype(int index) {
		String str = "";
		for (List<String> smp : sampleSNP) {
			System.out.println(smp.size());
			String gt_str = smp.get(index);
			int gt = 0;
			if (!gt_str.isEmpty()) {
				if (Double.parseDouble(gt_str) > 0.5) {
					gt = 1;
				}
			}
			str += gt + ":";
		}
		System.out.println(str);
		str.substring(0, str.length());
		return str;
	}

	private static String concatLine(String... strings) {
		List<String> string_list = Arrays.asList(strings);
		String str = "";
		for (String x : string_list) {
			str += x;
			if (string_list.indexOf(x) != string_list.size() - 1) {
				str += "\t";
			}
		}
		return str;
	}

	private static boolean checkRedundancy(int index) {
		if (index == pos.size()) {
			return false;
		}
		String curr_loc = parsePos(pos.get(index));
		if (last_pos.equals(curr_loc)) {
			return true;
		}
		return false;
	}

	private static String parsePos(String pos_entry) {
		LOGGER.info("parsing pos= " + pos_entry);
		int i = 0;
		String position = "";
		while (Character.isDigit(pos_entry.charAt(i))) {
			position += Character.toString(pos_entry.charAt(i));
			i++;
		}
		LOGGER.info("pos: " + position);
		return position;
	}

	private static String parseID(List<String> css_list, int index) {
		List<String> list = getRefAltAsList(css_list);
		String ref = list.get(0);
		String[] alts = list.get(1).split(",");
		String str = "";
		for (int i = 0; i < alts.length; i++) {
			str += ref + parsePos(pos.get(index)) + alts[i] + ",";
		}
		LOGGER.info("id: " + str.substring(0, str.length() - 1));
		return str.substring(0, str.length() - 1);
	}

	private static List<String> getRefAltAsList(List<String> css_list) {
		String ref = "";
		String alt = "";
		for (String css : css_list) {
			String[] ref_alt = css.split(snp_rgex);
			String prefix = ref_alt[0];
			int i = 0;
			while (Character.isDigit(prefix.charAt(i))) {
				i++;
			}
			// create ref
			ref = prefix.substring(i, prefix.length());
			// create alt tag value
			alt = ref_alt[1] + ", ";
		}
		return Arrays.asList(ref, alt.substring(0, alt.length() - 1));
	}

	private static String parseRefAlt(List<String> css_list) {
		String ref = "";
		String alt = "";
		for (String css : css_list) {
			String[] ref_alt = css.split(snp_rgex);
			String prefix = ref_alt[0];
			int i = 0;
			while (Character.isDigit(prefix.charAt(i))) {
				i++;
			}
			// create ref
			ref = prefix.substring(i, prefix.length());
			// create alt tag value
			alt = ref_alt[1] + ",";
		}
		return ref + "\t" + alt.substring(0, alt.length() - 1);
	}

	static void createVCF() {
		try {
			File file = new File("test.vcf");
			FileWriter fw = new FileWriter(file);
			BufferedWriter writer = new BufferedWriter(fw);
			List<String> md = VCFFileFormat.getMetaData();
			// write metadata
			for (String meta : md) {
				writer.write("##" + meta);
				writer.newLine();
			}
			// write tags
			List<String> tags = VCFFileFormat.getTags();
			String tag_row = "#";
			for (String tag : tags) {
				tag_row += tag + "\t";
			}
			writer.write(tag_row);
			writer.newLine();
			// write snps
			LOGGER.info("writing snp");
			for (int i = 0; i < pos.size(); i++) {
				if (last_pointer >= pos.size()) {
					break;
				}
				if (last_pointer > i) {
					LOGGER.info("get line item=" + i);
					writer.write(getLineItem(last_pointer));
					writer.newLine();
				} else {
					LOGGER.info("get line item=" + i);
					writer.write(getLineItem(i));
					writer.newLine();
				}
			}
			LOGGER.info("finished creating VCF");
			writer.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		args = new String[] {samples, "‪"};
		path = args[1];
		JFileChooser chooser = new JFileChooser();
		chooser.showOpenDialog(null);
		path = chooser.getSelectedFile().getAbsolutePath();
		try {
			sampleSNP = Parser.getSampleInfos(path);
			Parser.setPosWithSNP(path);
			if (!matchSNP(pos, snps)) {
				// do nothing perhaps log
				LOGGER.info("assertion false on snp location matches.");
			} else {
				createVCF();
			}
		} catch (Exception e) {
			LOGGER.info("e= " + e);
		}
	}
}